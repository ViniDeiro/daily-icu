import { View } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function Card({ children, className, noPadding }: CardProps) {
    return (
        <StyledView className={`bg-white border border-zinc-100 rounded-3xl shadow-sm ${noPadding ? "" : "p-6"} ${className}`}>
            {children}
        </StyledView>
    );
}
