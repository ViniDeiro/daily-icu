import { View } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);

export function Divider({ className }: { className?: string }) {
    return <StyledView className={`h-[1px] bg-slate-100 w-full ${className}`} />;
}
