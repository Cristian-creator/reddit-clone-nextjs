import * as React from 'react'
import { FormControl, InputLabel, Input, FormHelperText, TextareaAutosize } from '@material-ui/core';
import { useField } from 'formik';

//  
type InputFieldProps = (React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>) & {
    label: string;
    name: string;
    textarea?: boolean;
}

export const InputField: React.FC<InputFieldProps> =({label, textarea, color: _,...props}) => {
    const [field, { error }] = useField(props);
    // let InputOrTextarea = Input;
    // if(textarea) {
    //     InputOrTextarea = TextareaAutosize;
    // }
    return (
        <FormControl fullWidth error={!!error} >
            {/* <InputOrTextarea {...field} {...props} type={field.name} id={field.name} aria-describedby="my-helper-text" /> */}
            {
                textarea ? (
                        <TextareaAutosize rowsMin={4} {...field} {...props} id={field.name} />
                    ) : (
                    <>
                        <InputLabel htmlFor={field.name}> {label} </InputLabel>
                        <Input {...field} {...props} type={field.name} id={field.name} aria-describedby="my-helper-text" />
                    </>
                )
            }
            <FormHelperText id="my-helper-text">{error}</FormHelperText>
            {/* <FormHelperText id="my-helper-text">We'll never share your {props.name}.</FormHelperText> */}
        </FormControl>
    );
} 