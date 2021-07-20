import { Box, Link, Button } from '@material-ui/core';
import { Formik, Form } from 'formik';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';
import { useState } from 'react';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);  
    const [, forgotPassword] = useForgotPasswordMutation();

    return (
        <Wrapper variant="small">
            <Formik
              initialValues={{ email: '' }}
              onSubmit={async (values) => {
                await forgotPassword(values);
                setComplete(true);
              }}
             >
                 {() => complete ? <Box> if an account with that email exists, we sent you an email </Box> : (
                    <Form>
                        <Box marginTop={2}>
                            <InputField name="email" label="Email" />
                        </Box>
                        <Box display="flex" justifyContent="flex-end">
                            <NextLink href="/forgot-password">
                                <Link> forgot password? </Link>
                            </NextLink>
                        </Box>
                        <Button type="submit" variant="contained" color="primary" > forgot password </Button>
                     </Form>
                 )}
            </Formik>
        </Wrapper>
    ); 
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);