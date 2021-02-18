import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router";

import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Radio,
  Slide,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import useInterval from "./useInterval"
import MediaPlayer from "./MediaPlayer"

import Cookies from "js-cookie";

function Room(props) {
  const history = useHistory();
  const [roomCode, setRoomCode] = useState(props.match.params.roomCode);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [noSuchRoom, setNoSuchRoom] = useState(true);
  const [roomOrSettings, setRoomOrSettings] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [displayAlert, setDisplayAlert] = useState(false);
  const spotifyAuthenticated= useRef(false);
  const [song,setSong] = useState(null)

  const getCurrentSong = () =>{
    fetch("/spotify/current-song").then((response)=>{
      if(!response.ok){
        return {};
      }
      else{
        return response.json()
      }
    }).then((data)=>{
      console.log(data);
      setSong(data);
    });
  }

  useInterval(getCurrentSong,1000);


  const handleGuestCanPauseChange = () => {
    setGuestCanPause(guestCanPause == true ? false : true);
  };

  const handleVotesToSkip = (e) => {
    setVotesToSkip(e.target.value);
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          align="center"
          variant="contained"
          color="secondary"
          onClick={() => {
            setRoomOrSettings(false);
          }}
        >
          {" "}
          Change Settings
        </Button>
      </Grid>
    );
  };

  const authenticateSpotify = () =>{
    fetch('/spotify/is-authenticated').then((response)=>response.json()).then((data)=>{
      console.log("ALREADY AUTHENTICATED!!!!")
      spotifyAuthenticated.current=data.status
      if(!spotifyAuthenticated){
        fetch('/spotify/get-auth-url').then((response)=>response.json()).then((data)=>{
          window.location.replace(data.url);
        });
      }
    });
  }


  const renderRoomOrSettings = () => {
    return roomOrSettings ? (
     //<h1>base</h1>
      <MediaPlayer {...song}/>
    ) : (
      
      <Grid container spacing={1}>
          {displayAlert ? (
          <Slide direction="down" in={displayAlert} mountOnEnter unmountOnExit>
            <Alert severity="success" color="info" onClose={()=>{setDisplayAlert(false);}}>
              Room successfully updated!
            </Alert>
          </Slide>
        ) : null}
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            Update The Room
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText>
              <div align="center">Guest Control of Playback</div>
            </FormHelperText>
            <RadioGroup
              row
              defaultValue="true"
              onChange={handleGuestCanPauseChange}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play/Pause"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
            <TextField
              required={true}
              type="number"
              defaultValue={votesToSkip}
              onChange={handleVotesToSkip}
              inputProps={{
                min: 1,

                style: {
                  textAlign: "center",
                },
              }}
            ></TextField>
            <FormHelperText>
              <div align="center">Votes required to skip</div>
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => updateRoomRequest()}
          >
            Update Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setRoomOrSettings(true);
              setDisplayAlert(false);
            }}
          >
            Return to Room
          </Button>
        </Grid>
      </Grid>
    );
  };

  useEffect(async () => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
    };
    await fetch("/myapp/get-room" + "?code=" + roomCode, requestOptions)
      .then((response) => {
        if (response.status == 200) {
          setNoSuchRoom(false);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        if (data.is_host) {
          setIsHost(true);
          authenticateSpotify();
        }
      });
    console.log(roomCode);
  }, []);

  const handleUserLeavingRoom = async () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
    };
    await fetch("/myapp/leave-room", requestOptions).then((_response) => {
      spotifyAuthenticated.current=false;
      history.push("/myapp");
    });
  };

  const updateRoomRequest = async () => {
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: roomCode,
      }),
    };
    await fetch("/myapp/update-room", requestOptions).then((response) => {
      if (response.status == 200) {
        setDisplayAlert(true);
      }
    });
  };

  return noSuchRoom ? (
    <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" component="h3">
          {" "}
          No such room exists :'( This url is invalid...
        </Typography>
      </Grid>
    </Grid>
  ) : (
    renderRoomOrSettings()
  );
}

export default Room;
