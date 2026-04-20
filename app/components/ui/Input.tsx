import { TextInput, View, Text, TextInputProps } from "react-native";
import { styled } from "nativewind";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, className, containerClassName, ...props }: InputProps) {
    return (
        <StyledView className={`space-y-2 ${containerClassName}`}>
            {label && <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</StyledText>}
            <StyledTextInput
                className={`h-14 border border-slate-200 bg-slate-50 px-5 rounded-2xl text-slate-900 font-medium text-base focus:border-primary-500 focus:bg-white focus:shadow-sm focus:shadow-primary-100 ${className}`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8" // Slate-400
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                {...props}
            />
            {error && <StyledText className="text-critical text-xs font-bold ml-1">{error}</StyledText>}
        </StyledView>
    );
}
