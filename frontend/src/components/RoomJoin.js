import React, { Component, useState } from "react";
import { useHistory } from "react-router";
import Cookies from "js-cookie";


import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

function RoomJoin() {
  const history = useHistory()
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinRoomPress = () =>{
    const requestOptions={
        method:"POST",
        headers: {"Content-Type":"application/json", "X-CSRFToken":Cookies.get('csrftoken')},
        body: JSON.stringify({
            code:roomCode
        }),

    };
    fetch("/myapp/join-room",requestOptions).then((response) => response.ok?history.push('/myapp/room/'+roomCode):setError(response.statusText)).catch((error)=>console.log(error));
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Join a Room!!
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <TextField
          error={error}
          label="Code"
          placeholder="Enter a room code!"
          value={roomCode}
          helperText={error}
          variant="outlined"
          onChange={(e) => {
            setRoomCode(e.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            handleJoinRoomPress();
          }}
          component={Link}
        >
          Join Room
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          to="/myapp"
          component={Link}
        >
          Back
        </Button>
      </Grid>
    </Grid>
  );
}

export default RoomJoin;
