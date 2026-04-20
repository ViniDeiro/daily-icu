import { View, Text, TextInput, TextInputProps } from "react-native";
import { styled } from "nativewind";

interface FormFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    helper?: string;
    containerClassName?: string;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

export function FormField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, helper, className, containerClassName, multiline, numberOfLines, ...props }: FormFieldProps) {
    return (
        <StyledView className={`space-y-2 ${containerClassName}`}>
            {label && (
                <StyledText className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    {label}
                </StyledText>
            )}
            <StyledTextInput
                className={`
                    border border-slate-200 bg-slate-50 px-4 rounded-xl text-slate-900 font-medium text-base 
                    focus:border-primary-500 focus:bg-white focus:shadow-sm focus:shadow-primary-100
                    ${error ? "border-red-300 bg-red-50" : ""}
                    ${multiline ? "pt-4 min-h-[120px]" : "h-14"}
                    ${className}
                `}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                textAlignVertical={multiline ? "top" : "center"}
                {...props}
            />
            {error && <StyledText className="text-red-600 text-xs font-medium ml-1">{error}</StyledText>}
            {helper && !error && <StyledText className="text-slate-400 text-xs ml-1">{helper}</StyledText>}
        </StyledView>
    );
}
