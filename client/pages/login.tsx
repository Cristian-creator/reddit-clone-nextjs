import { Box, Button } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { Link } from '@material-ui/core';

export const Login: React.FC<{}> =({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
 
    return (
        <Wrapper variant="small">
            <Formik
              initialValues={{ usernameOrEmail: '', password: '' }}
              onSubmit={async (values, { setErrors }) => {
                const response = await login( values );
                
                if(response.data?.login.errors) {
                  // [{field: 'username', message: 'error'}]
                  // toErrorMap turns an array into objectnb
                    setErrors(toErrorMap(response.data.login.errors));
                }  else if (response.data?.login.user) {
                    if(typeof router.query.next === 'string') {
                        router.push(router.query.next);
                    } else {
                        // worked
                        router.push("/")
                    }
                }
              }}
             >
                 {() => (
                    <Form>
                        <Box>
                            <InputField name="usernameOrEmail" label="Username or Email" placeholder="Username or Email" />
                        </Box>
                        <Box marginTop={2}>
                            <InputField name="password" label="Password" />
                        </Box>
                        <Box display="flex" justifyContent="flex-end">
                            <NextLink href="/forgot-password">
                                <Link> forgot password? </Link>
                            </NextLink>
                        </Box>
                        <Button type="submit" variant="contained" color="primary" > Login </Button>
                     </Form>
                 )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Login);