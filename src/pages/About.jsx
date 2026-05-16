import AboutView from "../views/about/AboutView";

export default function About() {
  const terms = [
    {
      title: "1. Introduction",
      content:
        "Welcome to EDash, an academic dashboard designed to help students manage their schedules, tasks, and subjects efficiently. By using our web app, you agree to these terms and conditions.",
    },
    {
      title: "2. User Accounts & Third-Party Integrations",
      content:
        "You are responsible for maintaining the confidentiality of your account. By connecting your Google Calendar to EDash, you grant the application permission to access, sync, and display your calendar events to streamline your academic scheduling. We do not store or use your Google account credentials.",
    },
    {
      title: "3. User Data, Analytics & Control",
      content:
        "We store your academic data (subjects, schedules, and tasks) and generate productivity metrics for your personal Reports section. You retain absolute ownership of your data. EDash provides tools for you to manage, review, and export your data at any time via CSV format. We do not share your data or integrated calendar information with third parties.",
    },
    {
      title: "4. Prohibited Use",
      content:
        "You may not use this service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You are prohibited from violating or attempting to violate the security of the application or exploiting the API connections.",
    },
    {
      title: "5. Changes to Terms",
      content:
        "We reserve the right to update or change our Terms & Conditions at any time. Your continued use of the service after we post any modifications will constitute your acknowledgment and consent to abide by the modified Terms.",
    },
  ];

  return <AboutView terms={terms} />;
}