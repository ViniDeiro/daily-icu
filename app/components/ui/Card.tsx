import { View, ViewProps } from "react-native";
import { styled } from "nativewind";

interface CardProps extends ViewProps {
    noPadding?: boolean;
}

const StyledView = styled(View);

export function Card({ children, className, noPadding, ...props }: CardProps) {
    return (
        <StyledView 
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 ${noPadding ? "" : "p-6"} ${className}`} 
            {...props}
        >
            {children}
        </StyledView>
    );
}
