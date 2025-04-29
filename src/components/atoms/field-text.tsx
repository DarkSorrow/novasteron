import { useFormContext, Controller, get } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useTranslation } from "react-i18next";
//https://dev.to/rexebin/testing-a-mui-auto-complete-adaptor-component-integrating-react-hook-form-22p7
type FormInputProps = {
  name: string;
  defaultValue?: string;
} & TextFieldProps;

export const FieldText = ({ name, defaultValue, ...otherProps }: FormInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation();
  const error = get(errors, name);
  const isError = error !== undefined;

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <TextField
          label={name}
          {...field}
          {...otherProps}
          error={isError}
          helperText={isError ? t([`error.${error.message}`, '*'], { message: error.message }) : ''}
        />
      )}
    />
  );
};
