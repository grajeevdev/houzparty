import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import LinearProgress from "@material-ui/core/LinearProgress";
import Cookies from "js-cookie";


const useStyles = makeStyles((theme) => ({
  root: {
    display: "fixed",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    display:"inline-block",
    minHeight:300,
    minWidth: 300,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

export default function MediaPlayer(props) {
  const classes = useStyles();
  const theme = useTheme();
  const songProgress = (props.time / props.duration) * 100;

  const playOrPauseSong = () =>{
    const requestOptions = {
        method: "PUT",
        headers: {
            "Content-Type":"application/json",
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      };
      if(props.is_playing){
        console.log("we is pausing!")
        fetch("/spotify/pause-song",requestOptions).then((response)=>{});
        props.is_playing=false;
      }
      else{
        console.log("we is playing!")
        fetch("/spotify/play-song",requestOptions).then((response)=>console.log(response));
        props.is_playing=true;
      }
  }

  const nextSong = () =>{
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      };
    console.log("we is skippin!")
    fetch("/spotify/next-song",requestOptions).then((response)=>console.log(response));
  }

  const previousSong = () =>{
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      };
    console.log("we is pedalling back!")
    fetch("/spotify/previous-song",requestOptions).then((response)=>console.log(response));
  }

  return (
    <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            {props.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {props.artist}
          </Typography>
          <LinearProgress variant="determinate" value={songProgress} />
        </CardContent>
        <div className={classes.controls}>
          <IconButton aria-label="previous" onClick={previousSong}>
            {theme.direction === "rtl" ? (
              <SkipNextIcon />
            ) : (
              <SkipPreviousIcon />
            )}
          </IconButton>
          <IconButton aria-label="play/pause" onClick={playOrPauseSong} >
            {props.is_playing ? <PauseIcon  /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton aria-label="next" onClick={nextSong}>
            {theme.direction === "rtl" ? (
              <SkipPreviousIcon />
            ) : (
              <SkipNextIcon />
            )}
          </IconButton>
        </div>
        {props.votes} / {props.votes_required}
      </div>
      <CardMedia
        className={classes.cover}
        image={props.image_url}
        title="Live from space album cover"
      />
    </Card>
  );
}
