import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { Saps3Result } from "./types";
import { Card, StatusBadge } from "../../../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);

interface Props {
  result: Saps3Result;
}

export function Saps3Summary({ result }: Props) {
  return (
    <Card className="p-4 space-y-4 rounded-3xl border-slate-100 shadow-sm" noPadding>
      <StyledView className="flex-row items-center justify-between">
        <StyledView>
            <StyledText className="text-sm font-bold text-slate-500 uppercase tracking-wider">Score Total</StyledText>
            <StyledText className="text-4xl font-bold text-slate-900 tracking-tighter">{result.scoreTotal}</StyledText>
        </StyledView>
        <StyledView className="items-end">
            <StyledText className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mortalidade</StyledText>
            <StyledView className="flex-row items-baseline gap-1">
                <StyledText className="text-3xl font-bold text-critical tracking-tighter">{(result.probability * 100).toFixed(1)}%</StyledText>
            </StyledView>
            <StyledText className="text-[10px] text-slate-400 font-bold max-w-[120px] text-right">
                Modelo: {result.region.replace(/_/g, " ")}
            </StyledText>
        </StyledView>
      </StyledView>

      <StyledView className="bg-slate-50 p-3 rounded-xl border border-slate-100">
        <StyledText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalhamento dos Pontos</StyledText>
        {result.breakdown.map((item, i) => (
            <StyledView key={i} className="flex-row justify-between py-1 border-b border-slate-100 last:border-0">
                <StyledView className="flex-1">
                    <StyledText className="text-xs font-bold text-slate-700">{item.label}</StyledText>
                    <StyledText className="text-[10px] text-slate-400 font-medium">{item.value}</StyledText>
                </StyledView>
                <StatusBadge label={`+${item.points}`} status={item.points > 0 ? (item.points >= 10 ? "critical" : "warning") : "neutral"} />
            </StyledView>
        ))}
      </StyledView>
    </Card>
  );
}
