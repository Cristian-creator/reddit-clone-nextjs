import { Box, Link, Button } from '@material-ui/core';
import { Formik, Form } from 'formik';
import React, {useEffect} from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from "../components/Wrapper"
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from "next/router";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import Layout from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({ }) => {
    const router = useRouter();
    useIsAuth();

    const [, createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
              initialValues={{ title: '', text: '' }}
              onSubmit={async (values) => {
                  const { error } = await createPost({ input: values });
                  // here actions too error exchange
                  if(!error) {
                      router.push("/");
                  }
              }}
             >
                <Form>
                    <Box>
                        <InputField name="title" label="Title" placeholder="Title" />
                    </Box>
                    <Box marginTop={2}>
                        <InputField textarea={true} name="text" label="Body" placeholder="text..." />
                    </Box>
                    <Button type="submit" variant="contained" color="primary" > create post </Button>
                </Form>
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost);