import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Jumbotron, Button, ProgressBar, Spinner, InputGroup, FormControl, Card, Nav } from 'react-bootstrap';
import GameCompleteMsg from './GameCompleteMsg';
import Chat from './Chat';
import useApplicationData from "../hooks/useApplicationData";
import "./GameConsole.css"

export default function GameConsole(props) {

  const { attempts, setAttempts, levels } = useApplicationData()

  const [seconds, setSeconds] = useState(30);
  const [typingIn, setTypingIn] = useState("");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [intervalId, setIntervalId] = useState(null)
  const [levelContent, setLevelContent] = useState("Are You Ready To Start?")
  const [levelStarted, setLevelStarted] = useState(false)
  const [text, setText] = useState("");
  const [highestLevel, setHighestLevel] = useState(JSON.parse(localStorage.getItem("user_details"))?.highest_level_cleared);
  const [progressBarGame, setProgressBarGame] = useState(0);

  const currentUser = (localStorage.getItem("user_details") && JSON.parse(localStorage.getItem("user_details"))?.id)

  // calculate wpm of the user
  const totalAvgWpm = function (wordsDone, timeTaken) {
    let result = []
    const newValue = {}
    newValue.words_completed = wordsDone
    newValue.time_taken = timeTaken
    for (let attempt of attempts) {
      if (attempt.user_id === currentUser) {
        result.push(attempt)
      }
    }
    result = [...result, newValue]
    let totalWords = (result.reduce((a, b) => a + (parseInt(b.words_completed) || 0), 0))
    let totalTime = result.reduce((a, b) => a + (parseInt(b.time_taken) || 0), 0) / 60
    return totalWords / totalTime
  }

  //Get users so we can check the highest level cleared
  useEffect(() => {
    axios.get("/users", {
    })
      .then(res => {
        for (let user of res.data['users']) {
          if (user.id === JSON.parse(localStorage.getItem("user_details"))?.id) {
            setHighestLevel(user.highest_level_cleared)
          }
        }
      })
  }, [highestLevel])

  //Highlights the words that are right
  const highlightWords = (event) => {
    let value = event.target.value;
    let txt = document.getElementById("console-text").innerText;
    let idx = txt.indexOf(value);
    setTypingIn(value);
    if (idx >= 0) {
      let newText = [txt.substring(0, idx), <strong>{txt.substring(idx, idx + value.length)}</strong>, txt.substring(idx + value.length)];
      setLevelContent(newText);
      if (newText !== undefined) {
        setProgressBarGame(((text.length - newText[2]?.length) / text.length) * 100);
      }
    } else {
      setLevelContent(levelContent);
      if (levelContent !== undefined) {
        setProgressBarGame(((text.length - levelContent[2]?.length) / text.length) * 100);
      }
    }
  }

  //Timer to start and set seconds
  const Timer = function (seconds) {
    setLevelStarted(true)
    setSeconds(seconds)
    if (seconds > 0) {
      setIntervalId(setInterval(() => setSeconds((s) => s - 1), 1000))
    } else {
      setSeconds("Game Over");
    }
  }

  // use randomtext api to get random sentences
  const giveMeRandomText = (level_id) => {
    if (level_id === 0) return "Incorrect level_id entered."
    if (levels[level_id - 1] === undefined) return "Error occured"
    let nOfWords = levels[level_id - 1].number_of_words;
    axios.get(`https://www.randomtext.me/api/gibberish/p-1/${nOfWords}-${nOfWords}`)
      .then(res => {
        let taggedText = res.data.text_out;
        let cleanText = taggedText.replace(/<\/?[^>]+(>|$)/g, "");
        postContentToDB(cleanText, level_id);
        setLevelContent(cleanText)
        setText(cleanText)
      })
  }

  // post random content from api to our server
  const postContentToDB = (cleanText, level_id) => {
    axios.post('/contents', {
      cleanText: cleanText,
      level_id: level_id,
      theme_id: 1
    })
      .then(res => {
      })
      .catch(err => console.log("Catch block of posting content to DB from front end error", err))
  }

  //Starts the timer and the sets the level up
  const startGame = function () {
    console.log(currentLevel)
    setLevelStarted(true);
    setTypingIn("");
    clearInterval(intervalId)
    Timer(30)
    setCurrentLevel(currentLevel)
    setLevelContent(giveMeRandomText(currentLevel + 1))
    if (currentLevel === 0) {
      setCurrentLevel(0);
    }
  }

  //Triggered when they want to reset the current level
  const resetLevel = function () {
    setLevelStarted(false)
    setLevelContent("Are You Ready To Start?")
    setTypingIn("");
    clearInterval(intervalId)
    setCurrentLevel(currentLevel)
    setSeconds(30)
  }

  // Restarts the game from the first level
  const restartfromFirstLevel = function () {
    setLevelStarted(false)
    setLevelContent("Are You Ready To Start?")
    setTypingIn("");
    clearInterval(intervalId)
    setCurrentLevel(0);
    setSeconds(30)
  }

  //If they dont finish a level, this calcuates how many words were correct
  const totalWordsCorrect = function (inputField, currentLevelContent) {
    const typedIn = inputField.split(' ')
    const matchingwords = []
    for (let i = 0; i < typedIn.length; i++) {
      if (typedIn[i] === currentLevelContent[i])
        matchingwords.push(typedIn[i])
    }
    return matchingwords.length
  }

  //Resuming from the last cleared level button
  const resumeFromLastClearedLevel = function () {
    setLevelStarted(true)
    setCurrentLevel(highestLevel);
    setLevelContent(giveMeRandomText(highestLevel + 1))
    setSeconds(30)
    Timer(30)
    clearInterval(intervalId)
  }
  useEffect(() => {
    if (currentLevel !== 0) {
      setTypingIn("");
      clearInterval(intervalId)
      setLevelContent(giveMeRandomText(currentLevel + 1))
      setSeconds(30)
      Timer(30)
    }
    if (currentLevel > highestLevel) {
      setHighestLevel(currentLevel)
    }
  }, [currentLevel])

  //Post request to attempts if they fail the level.
  useEffect(() => {
    if (seconds === 0) {
      setSeconds("Game Over")
      setLevelStarted(false)
      let currentLevelWords = props.contents[currentLevel].content.split(' ')
      let totalOfCorrectWords = totalWordsCorrect(typingIn, currentLevelWords)
      let wpm = totalAvgWpm(totalOfCorrectWords, 30)
      setLevelContent("Game Over")
      clearInterval(intervalId)
      setTypingIn("");
      axios.post('/attempts', {
        user_id: JSON.parse(localStorage.getItem("user_details"))?.id,
        level_id: currentLevel + 1,
        words_completed: totalOfCorrectWords,
        time_taken: 30,
        passed: false,
        current_highest_level_passed: JSON.parse(localStorage.getItem("user_details"))?.highest_level_cleared,
        wpm: wpm
      })
        .then(res => {

        })
        .catch(err => console.log(err))
    }
  }, [seconds, intervalId]);

  //Post request to attempts if they pass the level
  useEffect(() => {
    if (typingIn === text.trim() && typingIn !== "") {
      setLevelContent(giveMeRandomText(currentLevel))
      let correctWords = text.split(' ').length;
      let secondsLeft = 30 - seconds;
      clearInterval(intervalId);
      setCurrentLevel(currentLevel + 1)
      setSeconds(30)
      setTypingIn("");
      axios.post('/attempts', {
        user_id: JSON.parse(localStorage.getItem("user_details"))?.id,
        level_id: currentLevel + 1,
        words_completed: correctWords,
        time_taken: secondsLeft,
        passed: true,
        current_highest_level_passed: JSON.parse(localStorage.getItem("user_details"))?.highest_level_cleared,
      })
        .then(res => {
          axios.post("/users", {
            user_id: JSON.parse(localStorage.getItem("user_details"))?.id,
            level_id: currentLevel + 1,
            wpm: totalAvgWpm(correctWords, secondsLeft),
            current_highest_level_passed: highestLevel
          })
          .then(res => {
            console.log(currentLevel, highestLevel)
            if (currentLevel > highestLevel) {
              setHighestLevel(currentLevel)
            }
          })
        })
        .catch(err => console.log(err))
    }
  }, [typingIn, intervalId])

  //Stops from pasting into text field.
  const handleChange = (e) => {
    e.preventDefault();
  };

  return (
    <div className="gameconsole">
      <Jumbotron className="game-area" style={{ marginBottom: 0 }}>
        <h1>TypeCraft</h1>
        <br />
        <ProgressBar aria-valuemin="0" aria-valuemax="100" animated now={typingIn ? progressBarGame : 0} variant="success" />
        <br />
        <Card>
          <Card.Header>
            <Nav className="gamePlayNav">
              <Nav.Item>
                Current Level: {currentLevel + 1}
              </Nav.Item>
              { seconds > 0? 
              <Nav.Item className="gameTimer">
                Time: {seconds} seconds
              </Nav.Item>
              :
              <Nav.Item className="gameTimerOver">
                Time's Up!!!
              </Nav.Item>
              }
              <Nav.Item className="gamePlayNav">
                Highest Level: {highestLevel}
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <blockquote className="blockquote mb-0">
              <div id="console-text">
                {currentLevel === 13 ? <GameCompleteMsg /> : levelContent}
              </div>
            </blockquote>
          </Card.Body>
        </Card>
        <br />
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text id="textarea">TYPE HERE:</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl as="textarea"
            onChange={(event) => highlightWords(event)}
            value={typingIn}
            id="textarea"
            aria-label="With textarea"
            onPaste={handleChange}
          />
        </InputGroup>
        <br />
        <p>
          {levelStarted === false && currentLevel !== 0 ?
            <Button className="startGame" variant="primary" onClick={restartfromFirstLevel}>
              Start from the begining
            </Button> : null}
          {levelStarted === false && highestLevel >= 1 && highestLevel !== currentLevel ?
            <Button className="startGame" variant="primary" onClick={resumeFromLastClearedLevel}>
              Start from level {highestLevel + 1}
            </Button> : null}
          {levelStarted === true ?
            <Button className="restartGame" variant="primary" onClick={resetLevel}>
              Restart Level
            </Button> : null}
          {levelStarted === false ?
            <Button
              className="startGame"
              variant="primary"
              onClick={startGame}
            >
              {(levelStarted === false || seconds !== "Game Over") && currentLevel === 0 ? `Start Game ` : `Start Level ${currentLevel + 1}!`}
            </Button> : null}
        </p>
      </Jumbotron>
      <Chat />
    </div>
  )
}