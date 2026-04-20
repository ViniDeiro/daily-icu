import { View, Text } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

export function KeyValueRow({ k, v }: { k: string; v: string }) {
    return (
        <StyledView className="flex-row justify-between py-2 border-b border-slate-50 last:border-0">
            <StyledText className="text-slate-500 font-medium text-sm">{k}</StyledText>
            <StyledText className="text-slate-900 font-bold text-sm text-right">{v}</StyledText>
        </StyledView>
    );
}
