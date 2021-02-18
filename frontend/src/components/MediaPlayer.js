import React, {useState, Component} from 'react';
import {Grid, Typography, Card, IconButton, LinearProgress} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";



const MediaPlayer = (props) =>{
    console.log(props);
    const [songProgress,setSongProgress] = useState((props.time/props.duration)*100);

    return(

        <Card>
            <Grid container alignItems="center">
            <Grid container alignItems="center" xs={4}>
                <img src={props.img_url} height="100%" weight="100%"/>
            </Grid>
            <Grid item align="center" xs={8}>
                <Typography variant="h5" component="h5">
                    {props.title}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    {props.artist}
                </Typography>
                <div>
                    <IconButton>
                        {props.is_playing? <PauseIcon/>:<PlayArrowIcon/>}
                    </IconButton>
                </div>
            </Grid>
            </Grid>
            <LinearProgress variant="determinate" value={songProgress}/>
        </Card>
    );
}

export default MediaPlayer;