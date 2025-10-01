import { StudentList } from "@/components/StudentList";
import { GraduationCap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Sistema de Gestão Acadêmica
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie alunos de forma simples e eficiente
              </p>
            </div>
          </div>
        </header>

        <main>
          <StudentList />
        </main>
      </div>
    </div>
  );
};

export default Index;
