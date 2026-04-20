import { Text } from "react-native";
import { styled } from "nativewind";

const StyledText = styled(Text);

export function SectionTitle({ title }: { title: string }) {
    return (
        <StyledText className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            {title}
        </StyledText>
    );
}
