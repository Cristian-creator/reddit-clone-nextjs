import { Box, Button, CircularProgress, makeStyles } from "@material-ui/core";
import { ChevronLeftOutlined, ChevronRightOutlined } from "@material-ui/icons";
import React from "react"
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

const useStyles = makeStyles({
    card: {
      margin: '20px 0px;'
    },
    rotateChevron: {
      transform: "rotate(90deg)",
      // cursor: "pointer"
    },
    cardContent: {
      padding: "16px !important"
    }
});

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const classes = useStyles();
    const [ ,vote] = useVoteMutation(); // cannot use fetching given by mutation because dont know which button is loading
    return (
        <Box paddingRight={2} display="flex" alignItems="center" flexDirection="column" >
            <Button onClick={async () => {
                if(post.voteStatus === 1) return;
                setLoadingState('updoot-loading');
                await vote({
                    postId: post.id,
                    value: 1,
                })
                setLoadingState('not-loading');
            }} variant="contained" color={ post.voteStatus === 1 ? "primary" : 'default' } >
                { loadingState === "updoot-loading" ? <CircularProgress size={24} /> : <ChevronLeftOutlined className={classes.rotateChevron} /> }
            </Button>
            { post.points }
            <Button onClick={async () => {
                if(post.voteStatus === -1) return;
                setLoadingState('downdoot-loading');
                await vote({
                    postId: post.id,
                    value: -1,
                })
                setLoadingState('not-loading');
             }} variant="contained" color={ post.voteStatus === -1 ? "secondary" : 'default' } 
              >
                { loadingState === "downdoot-loading" ? <CircularProgress size={24} /> : <ChevronRightOutlined className={classes.rotateChevron}  /> }
            </Button>
        </Box>
    );
}