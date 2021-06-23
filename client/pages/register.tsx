import { Box, Button } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface registerProps {}

export const Register: React.FC<registerProps> =({}) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();

    return (
        <Wrapper variant="small">
            <Formik
              initialValues={{ username: '', password: '' }}
              onSubmit={async (values, { setErrors }) => {
                const response = await register(values);
                
                if(response.data?.register.errors) {
                  setErrors(toErrorMap(response.data.register.errors));
                }  else if (response.data?.register.user) {
                    // worked
                    router.push("/");
                }
              }}
             >
                 {() => (
                    <Form>
                        <Box>
                            <InputField name="username" label="Username" />
                        </Box>
                        <Box marginTop={2}>
                            <InputField name="password" label="Password" />
                        </Box>
                        <Button type="submit" variant="contained" color="primary" > Register </Button>
                     </Form>
                 )}
            </Formik>
        </Wrapper>
    );
}

export default Register;