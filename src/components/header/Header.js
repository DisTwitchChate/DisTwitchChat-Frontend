import { useContext, useEffect, useState } from "react";
import "./Header.scss";
import { Link, withRouter } from "react-router-dom";
import { AppContext } from "../../contexts/Appcontext";
import { CSSTransition } from "react-transition-group";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Modal from "react-modal";
import A from "../Shared/A";
import ClearIcon from "@material-ui/icons/Clear";
import firebase from "../../firebase";
import HamburgerMenu from "react-hamburger-menu";

Modal.setAppElement("#root");

const Header = props => {
	const { currentUser, setCurrentUser } = useContext(AppContext);
	const { dropDownOpen: open, setDropDownOpen: setOpen } = useContext(AppContext);
	const [userDropDown, setUserDropDown] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [readTerms, setReadTerms] = useState(false);

	useEffect(() => {
		setUserDropDown(d => d && !!currentUser);
	}, [currentUser]);

	const user = firebase.auth.currentUser;

	useEffect(() => {
		if (user) {
			const unsub = firebase.db
				.collection("Streamers")
				.doc(user.uid)
				.onSnapshot(snapshot => {
					const data = snapshot.data();
					if (data) {
						const { displayName, profilePicture } = data;
						setCurrentUser(prev => ({
							...prev,
							name: displayName,
							profilePicture,
						}));
					}
				});
			return unsub;
		}
	}, [user, setCurrentUser]);

	return (
		<header className="header">
			<Modal isOpen={loginOpen} className="Modal" overlayClassName="Modal-Overlay" onRequestClose={() => setLoginOpen(false)}>
				<button className="exit-button" onClick={() => setLoginOpen(false)}>
					<ClearIcon />
				</button>
				<h1 className="modal-heading">Login to DisStreamChat</h1>
				<h2 className="modal-subheading">Connect with:</h2>

				<form
					className="modal-buttons"
					onSubmit={e => {
						e.preventDefault();
					}}
				>
					<button type="submit">
						<A
							href={
								readTerms
									? `https://id.twitch.tv/oauth2/authorize?client_id=ip3igc72c6wu7j00nqghb24duusmbr&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code&scope=openid%20moderation:read%20chat:edit%20chat:read%20channel:moderate%20channel:read:redemptions%20user_subscriptions`
									: null
							}
							className="modal-button twitch"
							disabled={!readTerms}
						>
							<img src={`${process.env.PUBLIC_URL}/social-media.svg`} alt="" width="20" className="logo-icon" />
							Twitch
						</A>
					</button>
					<button type="submit">
						<A
							href={
								readTerms
									? `https://discord.com/api/oauth2/authorize?client_id=702929032601403482&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}%2F%3Fdiscord%3Dtrue&response_type=code&scope=identify%20guilds`
									: null
							}
							className="modal-button discord"
							disabled={!readTerms}
						>
							<img
								style={{ filter: "grayscale(1) brightness(10000%)" }}
								src={`${process.env.PUBLIC_URL}/discord_logo.png`}
								alt=""
								width="20"
								className="logo-icon"
							/>
							Discord
						</A>
					</button>
					<div className="legal">
						<input
							required
							value={readTerms}
							onChange={e => setReadTerms(e.target.checked)}
							id="terms-check"
							type="checkbox"
							name="terms"
						/>
						<label htmlFor="terms-check">
							I accept the{" "}
							<A href="/terms" local newTab>
								terms and conditions
							</A>{" "}
							and{" "}
							<A href="/privacy" local newTab>
								privacy policy
							</A>
						</label>
					</div>
				</form>
			</Modal>
			<div className="hamburger-holder">
				<HamburgerMenu
					isOpen={open}
					menuClicked={() => setOpen(u => !u)}
					strokeWidth={3}
					rotate={0}
					color="white"
					borderRadius={5}
					animationDuration={0.5}
				/>
			</div>
			<span className="header--left">
				<Link to="/" className="logo" aria-label="disstreamchat logo">
					<img alt="Home" src={`${process.env.PUBLIC_URL}/logo.png`} width="100" />
				</Link>
				<nav className={`nav-bar ${open && "open"}`}>
					<Link to="/apps/download">Chat Manager</Link>
					<Link to="/bot">Discord Bot</Link>
					<Link to="/community">Community</Link>
					<A href="https://www.patreon.com/disstreamchat?fan_landing=true" newTab>
						Support Us
					</A>
					{firebase.auth.currentUser && (
						<Link to={`/dashboard/${firebase.auth.currentUser.uid}`}>
							Dashboard
						</Link>
					)}
					{/* <Link to="/about">About</Link> */}
				</nav>
			</span>
			<span className="header--right">
				{!currentUser ? (
					<button className="login-button" onClick={() => setLoginOpen(true)}>
						Login
					</button>
				) : (
					<ClickAwayListener onClickAway={() => setUserDropDown(false)}>
						<div className="full-user">
							<button className="user" onClick={() => setUserDropDown(d => !d)}>
								<span className="user--name">{currentUser.name}</span>
								<img className="profile-picture" src={currentUser.profilePicture} alt=""></img>
							</button>
							<CSSTransition unmountOnExit in={userDropDown} timeout={200} classNames="user-node">
								<div className="user-dropdown">
									<Link
										onClick={() => setUserDropDown(false)}
										to={`/dashboard/${firebase.auth.currentUser.uid}`}
										className="user-item"
									>
										Dashboard
									</Link>
									<div
										onClick={async () => {
											await firebase.logout();
											setCurrentUser(null);
										}}
										className="user-item logout"
									>
										Logout
									</div>
								</div>
							</CSSTransition>
						</div>
					</ClickAwayListener>
				)}
			</span>
		</header>
	);
};

export default withRouter(Header);
