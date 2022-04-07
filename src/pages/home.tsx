/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,const decodedIDToken = await getDecodedIDToken();

            // const derivedState = {
            //     authenticateResponse: basicUserInfo,
            //     idToken: idToken.split("."),
            //     decodedIdTokenHeader: JSON.parse(atob(idToken.split(".")[0])),
            //     decodedIDTokenPayload: decodedIDToken
            // };

            // setDerivedAuthenticationState(derivedState);
            // console.log(derivedState.decodedIDTokenPayload);
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useAuthContext } from "@asgardeo/auth-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { default as authConfig } from "../config.json";
import HOME_BACKGROUND from "../images/home-bg.jpg";
import COMPANY_LOGO from "../images/logo.png";
import COMPANY_LOGO_INVERSE from "../images/logo-inverse.png";
import FOOTER_LOGO from "../images/footer-logo.png";
import { DefaultLayout } from "../layouts/default";
import axios from "axios";
import qs from 'qs';


/**
 * Decoded ID Token Response component Prop types interface.
 */
type HomePagePropsInterface = {};

/**
 * Home page for the Sample.
 *
 * @param {HomePagePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const HomePage: FunctionComponent<HomePagePropsInterface> = (
    props: HomePagePropsInterface
): ReactElement => {

    const {
        state,
        signIn,
        signOut,
        getBasicUserInfo,
        getIDToken,
    } = useAuthContext();

    const [hasAuthenticationErrors, setHasAuthenticationErrors] = useState<boolean>(false);
    const [userDetails, setuserDetails] = useState<any>(null);

    useEffect(() => {

        if (!state?.isAuthenticated) {
            return;
        }

        (async (): Promise<void> => {
            const basicUserInfo = await getBasicUserInfo();
            const idToken = await getIDToken();

            const data = {
                'grant_type': 'urn:ietf:params:oauth:grant-type:token-exchange',
                'subject_token': idToken,
                'subject_token_type': 'urn:ietf:params:oauth:token-type:jwt',
                'requested_token_type': 'urn:ietf:params:oauth:token-type:jwt'
            };

            const accessToken = await axios(
                {
                    method: 'POST',
                    data: qs.stringify(data),
                    url: authConfig.choreo_configs.token_endpoint,
                    headers: {
                        Authorization: 'Basic ' + btoa(authConfig.choreo_configs.consumer_key + ':' + authConfig.choreo_configs.consumer_secret),
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }
            ).then((response) => {
                return response.data.access_token;
            })
                .catch(err => console.log(err))

            // get user details
            await axios(
                {
                    method: 'GET',
                    url: authConfig.choreo_configs.api_endpoint,
                    params: { username: basicUserInfo.email },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'content-type': 'application/json'
                    }
                }
            )
                .then((response) => {
                    setuserDetails(response.data);
                })
                .catch(err => console.log(err))

        })();

    }, [state.isAuthenticated]);

    const handleLogin = () => {
        signIn()
            .catch(() => setHasAuthenticationErrors(true));
    };

    const handleLogout = () => {
        signOut();
    };

    const handleDropdownOnClick = (e) => {
        e.target.classList.toggle("show");
    };

    // If `clientID` is not defined in `config.json`, show a UI warning. 
    if (!authConfig?.clientID) {

        return (
            <div className="content">
                <h2>You need to update the Client ID to proceed.</h2>
                <p>Please open "src/config.json" file using an editor, and update
                    the <code>clientID</code> value with the registered application's client ID.</p>
                <p>Visit repo <a
                    href="https://github.com/asgardeo/asgardeo-auth-react-sdk/tree/master/samples/asgardeo-react-app">README</a> for
                    more details.</p>
            </div>
        );
    }


    return (
        <DefaultLayout
            isLoading={state.isLoading}
            hasErrors={hasAuthenticationErrors}
        >
            {
                (state.isAuthenticated && userDetails) ?
                    (
                        <>
                            <div className="header">
                                <img src={COMPANY_LOGO} className="company-logo-image logo" />
                                <ul className="nav">
                                    <li>Online Certificates</li>
                                    <li>Group Programs</li>
                                    <li>Keynotes</li>
                                    <li className="dropdown dropdown-toggle" onClick={(e) => { handleDropdownOnClick(e) }}>
                                        Welcome {userDetails.user.firstName}
                                        <ul className="dropdown-menu text-small show">
                                            <li><a className="dropdown-item" onClick={() => { handleLogout() }}>Sign out</a></li>
                                        </ul>
                                    </li>
                                    <li>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    </li>
                                </ul>
                            </div>
                            <div className="content">
                                <div className="container">
                                    <div className="flex-grid">
                                        <div className="column side-nav-section" style={{ "width": "250px" }}>
                                            <ul className="side-nav">
                                                <li className="active">Student Profile</li>
                                                <li>Certifications</li>
                                                <li>Announcements</li>
                                                <li>Events</li>
                                                <li>Help</li>
                                            </ul>
                                        </div>
                                        <div className="column flex-column-auto">
                                            <h1 className="page-title">Student Profile</h1>
                                            <hr className="page-title-underline" />
                                            <div>
                                                <form>
                                                    <h2>Personal Information</h2>
                                                    <div className="field">
                                                        <label>First Name :</label>
                                                        <input type="text" readOnly value={userDetails?.user.firstName} />
                                                    </div>
                                                    <div className="field">
                                                        <label>Last Name :</label>
                                                        <input type="text" readOnly value={userDetails?.user.lastName} />
                                                    </div>
                                                    <div className="field">
                                                        <label>Email :</label>
                                                        <input type="text" readOnly value={userDetails?.user.email} />
                                                    </div>
                                                    <div className="field">
                                                        <label>Phone :</label>
                                                        <input type="text" readOnly value={userDetails?.user.phone} />
                                                    </div>
                                                    <div className="field">
                                                        <label>University :</label>
                                                        <input type="text" readOnly value={userDetails?.user.company} />
                                                    </div>
                                                    <div className="field">
                                                        <label>Title :</label>
                                                        <input type="text" readOnly value={userDetails?.user.title} />
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="column" style={{ "width": "300px" }}>
                                            <div className="section-box">
                                                <div className="section-box-header">Events</div>
                                                <div className="section-box-content">
                                                    <ul className="list">
                                                        {userDetails?.events.map((e) => <li key={e.id}>{e.eventDescription} <br /><i className="event-date">{e.date}</i></li>)}

                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="section-box">
                                                <div className="section-box-header">Announcements</div>
                                                <div className="section-box-content">
                                                    <ul className="list">
                                                        {userDetails?.annoucements.map((a) => <li key={a.id}>{a.announcementMsg} <br /></li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <footer>
                                <div className="container">
                                    <div className="left">
                                        <img src={FOOTER_LOGO} className="footer-logo-image logo" />
                                        <ul className="footer-links">
                                            <li>About ABC University</li>
                                            <li>Contact us</li>
                                            <li>Student Alumni</li>
                                            <li>University Course Guide</li>
                                        </ul>
                                        <ul className="footer-links">
                                            <li>Team</li>
                                            <li>Careers</li>
                                            <li>News</li>
                                            <li>Community</li>
                                        </ul>
                                        <ul className="footer-links">
                                            <li>White Papers</li>
                                            <li>Blogs</li>
                                            <li>Case Studies</li>
                                            <li>Upcoming Webinars</li>
                                        </ul>
                                        <ul className="footer-links">
                                            <li>Cloud Services</li>
                                            <li>Faculty Information</li>
                                            <li>Student Links</li>
                                            <li>Academic Calendar</li>
                                        </ul>
                                    </div>
                                </div>
                            </footer>
                        </>
                    )
                    : userDetails == null && !state.isAuthenticated ?
                        (
                            <div className="content flex-center home-page-content" style={{ backgroundImage: `url(${HOME_BACKGROUND})` }}>
                                <img src={COMPANY_LOGO_INVERSE} className="company-logo-image logo" />
                                <h1 className="home-description">
                                    Welcome to ABC Uni Student Portal. Please login to proceed.
                                </h1>
                                <button
                                    className="btn primary home-button"
                                    onClick={() => {
                                        handleLogin();
                                    }}
                                >
                                    Login
                                </button>
                            </div>
                        ) :
                        (
                            <div className="content">Loading ...</div>
                        )
            }
        </DefaultLayout>
    );
};
