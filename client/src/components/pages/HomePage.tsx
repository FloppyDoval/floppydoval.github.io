import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  SignIn,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import styles from "../../styles/HomePage.module.scss";
import { idText } from "typescript";

/**
 * HomePage component - The main landing page for LanguageGo.
 * This component displays the platform's branding, introduction, and options to sign in or start learning.
 */


const HomePage = () => {


  const [bool, setBool] = useState<boolean>(true); 
  const [userTag, setUserTag] = useState<string>(""); 
  const [userScore, setUserScore] = useState<string>();
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  
  let  user  = useUser().user;


  async function getUserScore(){
      console.log(user);
      //const f = user.user?.id
      //console.log(user?.id);
      if(user != null){
        const userData = await fetch("http://localhost:3232/getScore?userid=" + user?.id);
        console.log(user);
        const userScore = await userData.json();
        setUserScore(userScore.score[0].score);
        console.log(userScore.score[0]);
      }
  }
  // const fetchUserScore = async (): Promise<number> => {

  //     if(user != null && bool){
  //       setBool(false);
  //       const userData = await fetch("http://localhost:3232/getScore?userid=" + user?.id);
  //       console.log(user);
  //       const userScore = await userData.json();
  //       setUserScore(userScore.score[0].score);
  //       console.log(userScore.score[0]);
  //     }
  // }
  
  return (
    <div>
      <div className={styles.flagBar}>
        <img
          src="/logo.png"
          alt="Logo"
          aria-label="Platform logo"
          className={styles.logo}
        />
        <img
          src="/korea.png"
          alt="Flag 1"
          aria-label="Korean flag"
          className={styles.flag}
        />
        <img
          src="/japan.png"
          alt="Flag 2"
          aria-label="Japanese flag"
          className={styles.flag}
        />
        <img
          src="/mongolia.png"
          alt="Flag 3"
          aria-label="Mongolian flag"
          className={styles.flag}
        />
        <img
          src="/china.png"
          alt="Flag 4"
          aria-label="Chinese flag"
          className={styles.flag}
        />
      </div>

      <h1
        className={styles.header}
        aria-label="Welcome to LanguageGo!"
      >
        Welcome to LanguageGo!
      </h1>

      <h3
        className={styles.slogan}
        aria-label="Platform Slogan"
      >
        The Best Way to Practice Typing in a New Language
      </h3>

      <p
        className={styles.description}
        aria-label="Platform description"
      >
        Our platform helps you learn how to type in new languages quickly and
        effectively. By providing interactive lessons and practice exercises, we
        focus on building muscle memory for typing different alphabets. Whether
        you're learning Hangul, Arabic, or any other script, you'll be able to
        practice typing in a new language and improve your speed and accuracy
        over time.
      </p>

      <div className="videoandstats">
        <video
          width="600"
          loop
          autoPlay
          muted
          aria-label="Demo Video"
          className={styles.video}
        >
          <source src="/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <SignedIn>

          <p className={styles.description}>If you want your score to be displayed on the Leaderboard, enter or update your User Tag!</p>
          
          <input className={styles.inputBox}
          type="text"
          value={userTag}
          onChange={(e) => setUserTag(e.target.value)}
          placeholder="Enter Here!"
          onKeyPress={async (e) => {
            if (e.key === 'Enter') {
              setUserTag("")
              await fetch("http://localhost:3232/updateTag?tag="+ userTag +"&userid=" + user?.id)
            }
          }}
          />
        </SignedIn>
      </div>
      
      <div className={styles.buttonContainer}>
        <SignedOut>
          <SignInButton>
            <Link to="/">
              <button
                aria-label="Sign In Button"
                className={styles.button}
                >
                Sign In
              </button>
            </Link>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SignOutButton>
            <Link to="/">
              <button
                aria-label="Sign Out Button"
                className={styles.button}
                >
                Sign Out
              </button>
            </Link>
          </SignOutButton>
        </SignedIn>
        <Link to="/leaderBoard">
          <button
            className={styles.button}
            aria-label="Sign In Button"
          >
            LeaderBoard
          </button>
        </Link>
        <Link to="/learnPage">
          <button
            className={styles.button}
            aria-label="Learning Mode Button"
          >
            Learning Mode
          </button>
        </Link>
        <div className={styles.levelDropdown}>
        <button
          className={styles.button}
          onClick={() => setShowLevelMenu(!showLevelMenu)}
          aria-label="Select Practice Level"
        >
          Practice Mode
        </button>
        {showLevelMenu && (
          <div className={styles.dropdownMenu}>
            <Link to="/practicePage/beginner">
              <button className={styles.levelButton}>Beginner</button>
            </Link>
            <Link to="/practicePage/intermediate">
              <button className={styles.levelButton}>Intermediate</button>
            </Link>
            <Link to="/practicePage/advanced">
              <button className={styles.levelButton}>Advanced</button>
            </Link>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
