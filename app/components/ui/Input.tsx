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
        <StyledView className={`space-y-1.5 ${containerClassName}`}>
            {label && <StyledText className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">{label}</StyledText>}
            <StyledTextInput
                className={`h-14 border border-zinc-200 bg-zinc-50 px-4 rounded-2xl text-zinc-900 font-medium text-base focus:border-black focus:bg-white ${className}`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#A1A1AA"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                {...props}
            />
            {error && <StyledText className="text-red-600 text-xs font-medium ml-1">{error}</StyledText>}
        </StyledView>
    );
}
