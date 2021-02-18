import React, { Component } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useHistory } from "react-router";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Cookies from "js-cookie";

function CreateRoomPage() {
  const history = useHistory();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(true);

  const handleGuestCanPauseChange = () => {
    setGuestCanPause(guestCanPause == true ? false : true);
  };

  const handleVotesToSkip = (e) => {
    setVotesToSkip(e.target.value);
  };

  const submitRoomCreateRequest = () => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };
    fetch("/myapp/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        history.push("/myapp/room/" + data.code);
      });
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          Create A Room
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
        <Button variant="contained" color="primary" onClick={submitRoomCreateRequest}>
          Create a room
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          color="secondary"
          component={Link}
          variant="contained"
          to="/myapp"
        >
          Return to home page
        </Button>
      </Grid>
    </Grid>
  );
}

export default CreateRoomPage;
