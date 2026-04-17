import { Card } from "../components/ui/card";

export default function About() {
  const terms = [
    {
      title: "1. Introduction",
      content:
        "Welcome to EDash, an academic dashboard designed to help students manage their schedules, tasks, and subjects efficiently. By using our web app, you agree to these terms and conditions.",
    },
    {
      title: "2. User Accounts",
      content:
        "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.",
    },
    {
      title: "3. User Data",
      content:
        "We store your academic data, such as subjects, schedules, and tasks, to provide the service. We are committed to protecting your data and will not share it with third parties without your consent, except as required by law.",
    },
    {
      title: "4. Prohibited Use",
      content:
        "You may not use this service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You are prohibited from violating or attempting to violate the security of the application.",
    },
    {
      title: "5. Changes to Terms",
      content:
        "We reserve the right to update or change our Terms & Conditions at any time. Your continued use of the service after we post any modifications will constitute your acknowledgment and consent to abide by the modified Terms.",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-5xl font-semibold text-[#283728]">
        About & Terms
      </h2>
      <Card className="border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-7 shadow-none">
        <div className="space-y-6">
          {terms.map((term) => (
            <div key={term.title}>
              <h3 className="text-2xl font-semibold text-[#354737]">
                {term.title}
              </h3>
              <p className="mt-2 text-lg text-[#6e7c69]">{term.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}