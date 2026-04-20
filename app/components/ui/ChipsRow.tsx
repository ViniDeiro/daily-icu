import { View } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export function ChipsRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <StyledView className={`flex-row flex-wrap gap-2 ${className}`}>
            {children}
        </StyledView>
    );
}
