import { Fragment, useEffect, useState, useCallback, useContext, useMemo } from "react";
import { NavLink, Route, Redirect, Switch } from "react-router-dom";
import firebase from "../../firebase";
import "./Dashboard.scss";
import A from "../Shared/A";
import SettingBox from "./Settings/SettingBox";
import { AppContext } from "../../contexts/Appcontext";
import DiscordPage from "./Discord/DiscordPage";
import AccountSettings from "./Account/Account";
import plugins from "./Discord/Plugins/plugins.json";
import { DiscordContextProvider, DiscordContext } from "../../contexts/DiscordContext";
import { useMediaQuery } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useDocument } from "react-firebase-hooks/firestore";

const Dashboard = props => {
	// const [overlaySettings, setOverlaySettings] = useState();
	const [appSettings, setAppSettings] = useState();
	const [defaultSettings, setDefaultSettings] = useState();
	const { currentUser, dropDownOpen: open } = useContext(AppContext);
	const id = firebase.auth.currentUser.uid;
	const [discordId, setDiscordId] = useState("");
	const { activePlugins, dashboardOpen, setDashboardOpen, setUserDiscordInfo } = useContext(
		DiscordContext
	);

	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setDashboardOpen(false);
	};

	useEffect(() => {
		const idRegex = new RegExp("/\\d{17,19}[/\\b]");
		const path = props.location.pathname + "/";
		const id = path.match(idRegex);
		if (id) {
			setDiscordId(id[0].replace(/\//g, ""));
		}
	}, [props]);

	useEffect(() => {
		(async () => {
			const settingsRef = await firebase.db.collection("defaults").doc("settings15").get();
			const settingsData = settingsRef.data().settings;
			setDefaultSettings(settingsData);
		})();
	}, []);

	const updateAppSetting = useCallback(
		async (name, value) => {
			const copy = { ...appSettings };
			copy[name] = value;
			setAppSettings(copy);
			const userRef = firebase.db.collection("Streamers").doc(id);
			await userRef.update({
				appSettings: copy,
			});
		},
		[appSettings, id]
	);

	// const updateOverlaySetting = useCallback(
	// 	async (name, value) => {
	// 		const copy = { ...overlaySettings };
	// 		copy[name] = value;
	// 		setOverlaySettings(copy);
	// 		const userRef = firebase.db.collection("Streamers").doc(id);
	// 		await userRef.update({
	// 			overlaySettings: copy,
	// 		});
	// 	},
	// 	[overlaySettings, id]
	// );

	useEffect(() => {
		(async () => {
			if (currentUser) {
				// setOverlaySettings(currentUser.overlaySettings);
				setAppSettings(currentUser.appSettings);
			}
		})();
	}, [currentUser]);

	const displayPlugins = useMemo(
		() =>
			Object.keys(activePlugins || {})
				.filter(key => activePlugins[key])
				.sort(),
		[activePlugins]
	);

	const showDropdown = useMediaQuery("(min-width: 900px)");

	// TODO: handle error with third item in this array
	const [rawDiscordData, discordDataLoading] = useDocument(
		firebase.db.doc(`Streamers/${id}/discord/data`)
	);

	useEffect(() => {
		if (discordDataLoading) return;
		setUserDiscordInfo(rawDiscordData?.data());
	}, [rawDiscordData, discordDataLoading, setUserDiscordInfo]);

	return (
		<div className="settings-container">
			<div className={`${open ? "dashboard-open" : ""} setting-options`}>
				<NavLink
					className="setting-link"
					activeClassName="active"
					to={`${props.match.url}/appsettings`}
				>
					App Settings
				</NavLink>
				{/* <NavLink className="setting-link" activeClassName="active" to={`${props.match.url}/overlaysettings`}>
					overlay Settings
				</NavLink> */}
				<NavLink
					className="setting-link"
					activeClassName="active"
					to={`${props.match.url}/discord${discordId ? `/${discordId}` : ""}`}
				>
					Discord Settings
				</NavLink>
				{showDropdown &&
					!!displayPlugins.length &&
					window?.location?.pathname?.includes?.("discord") && (
					<ul>
						{displayPlugins.map(key => {
							const plugin = plugins.find(plugin => plugin.id === key);
							if (!plugin) return null;
							return (
								<NavLink
									key={plugin?.id}
									className="setting-link smaller"
									activeClassName="active"
									to={`${props.match.url}/discord/${discordId}/${plugin?.id}`}
								>
									{plugin?.title}
								</NavLink>
							);
						})}
					</ul>
				)}
				<NavLink
					className="setting-link"
					activeClassName="active"
					to={`${props.match.url}/account`}
				>
					Account Settings
				</NavLink>
			</div>
			<div className="settings">
				<Switch>
					<Route path={`${props.match.url}/account`} component={AccountSettings}></Route>
					<Route path={`${props.match.url}/discord/:id`} component={DiscordPage}></Route>
					<Route path={`${props.match.url}/discord`} component={DiscordPage}></Route>
					{/* <Route path={`${props.match.url}/overlaysettings`}>
						<SettingBox
							title="Overlay Settings"
							subtitle={
								<>
									Adjust the settings of your overlay. if you don't use the overlay but want to you can start using it{" "}
									<A className="ul bld" href="/apps" newTab local>
										here
									</A>
								</>
							}
							path="overlaysettings"
							parenturl={props.match.url}
							defaultSettings={defaultSettings}
							settings={overlaySettings}
							updateSettings={updateOverlaySetting}
						/>
					</Route> */}
					<Route path={`${props.match.url}/appsettings`}>
						<SettingBox
							title="App Settings"
							subtitle={
								<>
									Adjust the settings of your app. if you don't use the app but
									want to you can start using it{" "}
									<A className="ul bld" href="/apps" newTab local>
										here
									</A>
								</>
							}
							path="appsettings"
							parenturl={props.match.url}
							defaultSettings={defaultSettings}
							settings={appSettings}
							updateSettings={updateAppSetting}
							app
						/>
					</Route>
					<Redirect to={`${props.match.url}/appsettings`} />
				</Switch>
				<Snackbar
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					open={dashboardOpen}
					autoHideDuration={6000}
					onClose={handleClose}
					message="Saved"
					action={
						<Fragment>
							<IconButton
								size="small"
								aria-label="close"
								color="inherit"
								onClick={handleClose}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Fragment>
					}
				/>
			</div>
		</div>
	);
};

const IntermediateDashboard = props => {
	return (
		<DiscordContextProvider>
			<Dashboard {...props} />
		</DiscordContextProvider>
	);
};

export default IntermediateDashboard;
