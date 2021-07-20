import React from 'react';
import { CardActions, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number;
}

// not passing post as props in order to be reused for other components
const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
    const [{ data: meData }] = useMeQuery();

    const [, deletePost] = useDeletePostMutation();

    if(meData?.me?.id !== creatorId) {
        return null;
    }

    return (
        <CardActions>
            <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
            <IconButton
            color="primary" aria-label="edit">
                <EditIcon />
            </IconButton>
            </NextLink>
            <IconButton 
            color="secondary" aria-label="delete"
            onClick={() => {
                deletePost({ id });
            }}>
            <DeleteIcon />
            </IconButton>
        </CardActions>
    );
}

export default EditDeletePostButtons;