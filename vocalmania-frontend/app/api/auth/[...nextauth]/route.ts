import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      // Optional: Hier kannst du prüfen, ob die E-Mail-Adresse in einer Liste
      // der Chormitglieder steht oder ob der Login für alle freigegeben ist.
      const allowedEmails = (process.env.ALLOWED_CHOR_EMAILS || "").split(",");
      
      // Wenn keine Liste hinterlegt ist, ist jeder Google-Login erlaubt (oder du prüfst z.B. auf @gmail.com etc.)
      if (allowedEmails.length > 0 && allowedEmails[0] !== "") {
        return user.email ? allowedEmails.includes(user.email) : false;
      }
      
      return true; // Erlaubt vorerst jeden erfolgreichen Google-Login
    },
  },
  pages: {
    signIn: '/intern/login', // Eigene Login-Seite, die wir gleich erstellen
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };