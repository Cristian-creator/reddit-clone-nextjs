import { Box, Typography } from '@material-ui/core';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post = ({}) => {
    const [{data, fetching, error}] = useGetPostFromUrl();
    
    if(fetching) {
        return (
            <Layout>
                loading...
            </Layout>
        )
    }

    if(error) {
        return (
            <Box> {error.message} </Box>
        )
    }

    if(!data?.post) {
        return <Layout>
            <Box> could not find post </Box>
        </Layout>
    }

    return (
        <Layout>
            <Box>
                <Typography variant="h4">
                    {data?.post?.title}
                </Typography>
            </Box>
            <Typography variant="p">
                {data.post.text}
            </Typography>
            <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id} />
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);