import * as React from 'react'
import { FormControl, InputLabel, Input, FormHelperText, FormLabel } from '@material-ui/core';
import { useField } from 'formik';

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
}

export const InputField: React.FC<InputFieldProps> =({label, color: _, ...props}) => {
    const [field, { error }] = useField(props);
    return (
        <FormControl fullWidth error={!!error} >
            <InputLabel htmlFor={field.name}> {label} </InputLabel>
            <Input {...field} {...props} type={field.name} id={field.name} aria-describedby="my-helper-text" />
            <FormHelperText id="my-helper-text">{error}</FormHelperText>
            {/* <FormHelperText id="my-helper-text">We'll never share your {props.name}.</FormHelperText> */}
        </FormControl>
    );
} 