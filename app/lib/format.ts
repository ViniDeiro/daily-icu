export function formatDateBR(date: Date) {
    return date.toLocaleDateString("pt-BR");
}

export function formatISODate(iso: string | null | undefined) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return formatDateBR(d);
}

export function calcAge(dateOfBirthISO: string | null | undefined) {
    if (!dateOfBirthISO) return null;
    const dob = new Date(dateOfBirthISO);
    if (Number.isNaN(dob.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
    return age;
}
