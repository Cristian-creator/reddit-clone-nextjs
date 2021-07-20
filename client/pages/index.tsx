import { Box, Button, Card, CardContent, Link, makeStyles, Typography } from "@material-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from 'next/link';
import { useState } from "react";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import Layout from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import theme from "../utils/theme";

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
  },
  button: {
    margin: theme.spacing(1),
    color: "white"
  },
});

// server side rendering if i query some data and that data is important for SEO
const IndexPage = () => { 
  const classes = useStyles();
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });
  const [{ data, fetching, error }] = usePostsQuery({
    variables
  });

  if(!fetching && !data) {
    return <div className="">
      <h4> {error?.message} </h4>
      <div> you got query failed for some reason </div>
     </div> 
  }  

  return (
    <Layout>
      <Box>
        {
          !data && fetching ? (<div> loading </div>) : data!.posts.posts.map(p => !p ? null : (
            <Card key={p.id} className={classes.card}>
              <Box display="flex" justifyContent="space-between" alignItems="center" >
                <CardContent className={classes.cardContent} >
                  <Box display="flex" alignItems="center" >
                    <UpdootSection post={p} />
                    <Box>
                      <NextLink href="/post/[id]" as={`/post/${p.id}`} >
                        <Link component="button" variant="body2" >
                          <Typography className={""} color="textSecondary" gutterBottom>
                            {p.title}
                          </Typography>
                        </Link>
                      </NextLink>
                      <Typography variant="body2" component="p">
                        posted by {p.creator.username}
                      </Typography>
                      <Typography variant="body2" component="p">
                        {p.textSnippet}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <EditDeletePostButtons id={p.id} creatorId={p.creator.id} /> 
              </Box>
            </Card>
          )) 
        }        
      </Box>
      { data && data.posts.hasMore && (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Button onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt, 
              })
            }} > Load more </Button>
          </Box>
        )
      }
    </Layout> 
  )
};

export default withUrqlClient(createUrqlClient)(IndexPage);
