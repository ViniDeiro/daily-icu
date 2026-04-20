import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface SegmentedControlProps {
    values: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    labels?: string[]; // Optional display labels
}

export function SegmentedControl({ values, selectedIndex, onChange, labels }: SegmentedControlProps) {
    return (
        <StyledView className="flex-row bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {values.map((value, index) => {
                const isSelected = selectedIndex === index;
                const label = labels ? labels[index] : value;
                return (
                    <StyledTouchableOpacity
                        key={value}
                        onPress={() => onChange(index)}
                        className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                            isSelected ? "bg-white shadow-sm border border-slate-100" : "bg-transparent border border-transparent"
                        }`}
                        activeOpacity={0.7}
                    >
                        <StyledText 
                            className={`text-xs font-bold uppercase tracking-wide ${
                                isSelected ? "text-slate-900" : "text-slate-500"
                            }`}
                        >
                            {label}
                        </StyledText>
                    </StyledTouchableOpacity>
                );
            })}
        </StyledView>
    );
}
