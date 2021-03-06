import { Box, Button, Link } from '@material-ui/core';
import { Formik, Form } from 'formik';
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react'
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

const ChangePassword: NextPage<{token: string}> = () => {
    const router = useRouter();
    const [,changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');
    return (
        <Wrapper variant="small">   
            <Formik
              initialValues={{ newPassword: ""}}
              onSubmit={async (values, {  setErrors }) => {
                
                const response = await changePassword({
                    newPassword: values.newPassword,
                    token: router.query.token === 'string' ? router.query.token : '',
                });
                
                if(response.data?.changePassword.errors) {
                  // [{field: 'username', message: 'error'}]
                  // toErrorMap turns an array into object
                  const errorMap = toErrorMap(response.data.changePassword.errors);
                  if('token' in errorMap) {
                      setTokenError(errorMap.token);
                  } 
                  setErrors(errorMap); 
                }  else if (response.data?.changePassword.user) {
                    // worked
                    router.push("/");
                }

              }}
             >
                 {() => (
                    <Form>
                        <Box marginTop={2}>
                            <InputField name="newPassword" type="password" label="New Password" />
                        </Box>
                        { tokenError && 
                        <Box display="flex" >
                            <Box marginRight={3} style={{ color: "red" }}> {tokenError} </Box >
                            <NextLink href="/forgot-password">
                                <Link> click here to get a new one </Link>
                            </NextLink>
                        </Box> }
                        <Button type="submit" variant="contained" color="primary" > Change password </Button>
                     </Form>
                 )}
            </Formik>
        </Wrapper>
    );
}

// ChangePassword.getInitialProps = ({ query }) => {
//     return {
//         token: query.token as string
//     }
// }

export default withUrqlClient(createUrqlClient)(ChangePassword);