import { Text, Pressable, ActivityIndicator, View } from "react-native";
import { styled } from "nativewind";

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "destructive" | "ghost";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

export function Button({ label, onPress, variant = "primary", disabled, loading, className }: ButtonProps) {
    const baseStyle = "h-14 px-8 items-center justify-center rounded-2xl flex-row space-x-2";

    const variants = {
        primary: "bg-black shadow-sm active:opacity-90",
        secondary: "bg-white border border-zinc-200 active:bg-zinc-50 shadow-sm",
        destructive: "bg-red-600 active:opacity-90 shadow-sm",
        ghost: "bg-transparent active:bg-zinc-50",
    };

    const textVariants = {
        primary: "text-white font-bold tracking-tight text-base",
        secondary: "text-zinc-900 font-semibold text-base",
        destructive: "text-white font-bold text-base",
        ghost: "text-zinc-900 font-medium text-base",
    };

    return (
        <StyledPressable
            onPress={onPress}
            disabled={disabled || loading}
            className={`${baseStyle} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
        >
            {loading ? (
                <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "black" : "white"} />
            ) : (
                <StyledText className={textVariants[variant]}>{label}</StyledText>
            )}
        </StyledPressable>
    );
}
