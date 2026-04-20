import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";
import { styled } from "nativewind";

interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: "primary" | "secondary" | "ghost" | "critical";
    loading?: boolean;
}

const StyledButton = styled(TouchableOpacity);
const StyledText = styled(Text);

export function Button({ label, variant = "primary", loading, className, disabled, ...props }: ButtonProps) {
    const baseClass = "h-14 rounded-2xl flex-row items-center justify-center px-6 shadow-sm";
    
    // Variantes com cores atualizadas (Teal/Slate)
    const variants = {
        primary: "bg-primary-600 active:bg-primary-700 shadow-primary-600/20", // Teal vibrante
        secondary: "bg-white border border-slate-200 active:bg-slate-50", // Branco com borda suave
        ghost: "bg-transparent active:bg-slate-100 shadow-none",
        critical: "bg-critical active:bg-red-600 shadow-critical/20"
    };

    const textVariants = {
        primary: "text-white font-bold text-base tracking-wide",
        secondary: "text-slate-700 font-bold text-base",
        ghost: "text-primary-600 font-bold text-base",
        critical: "text-white font-bold text-base"
    };

    return (
        <StyledButton 
            className={`${baseClass} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "#0F766E" : "white"} />
            ) : (
                <StyledText className={textVariants[variant]}>{label}</StyledText>
            )}
        </StyledButton>
    );
}
