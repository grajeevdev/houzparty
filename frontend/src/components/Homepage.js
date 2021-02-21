import React, { Component, useEffect, useState } from "react";
import RoomJoin from "./RoomJoin";
import Room from "./Room";
import CreateRoomPage from "./CreateRoomPage";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import {
  TextField,
  Button,
  ButtonGroup,
  Grid,
  Typography,
} from "@material-ui/core";

const Homepage = (props) => {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(async () => {
    fetch("/myapp/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        setRoomCode(data.code);
      });
  }, []);

  const handleRoomCodeOnExit = () => {
    setRoomCode(null);
  };

  const renderHomePage = () => {
    return (
      <Grid container spacing={12}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" component="h3">
            House Party!
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/myapp/join" component={Link}>
              Join a room!
            </Button>
            <Button color="secondary" to="/myapp/create" component={Link}>
              Create a room!
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  };

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/myapp/"
          render={() => {
            return roomCode ? (
              <Redirect to={"/myapp/room/" + roomCode} />
            ) : (
              renderHomePage()
            );
          }}
        />
        <Route path="/myapp/join" component={RoomJoin} />
        <Route path="/myapp/create" component={CreateRoomPage} />
        <Route
          path="/myapp/room/:roomCode"
          render={(props) => {
            return <Room props={props} callback={handleRoomCodeOnExit}/>;
          }}
        />
      </Switch>
    </Router>
  );
};

export default Homepage;
