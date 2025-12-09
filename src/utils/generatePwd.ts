export const generateStrongPassword = (length = 12): string => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = ".@";
    const all = upper + lower + digits + special;
    const commonPasswords = ["password", "123456", "12345678", "qwerty", "letmein"];
    const getRandom = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

    let pwd = "";
    pwd += getRandom(upper);
    pwd += getRandom(lower);
    pwd += getRandom(digits);
    pwd += getRandom(special);

    while (pwd.length < length) {
        const char = getRandom(all);
        if (pwd.length >= 2 && pwd[pwd.length - 1] === char && pwd[pwd.length - 2] === char) continue;
        pwd += char;
    }

    pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");
    if (commonPasswords.includes(pwd.toLowerCase())) return generateStrongPassword(length);

    return pwd;   
};