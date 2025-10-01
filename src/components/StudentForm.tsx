import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const studentSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  registration_number: z.string()
    .trim()
    .min(1, "Matrícula é obrigatória")
    .max(50, "Matrícula deve ter no máximo 50 caracteres"),
  course: z.string()
    .trim()
    .min(1, "Curso é obrigatório")
    .max(100, "Curso deve ter no máximo 100 caracteres"),
  age: z.coerce.number()
    .int("Idade deve ser um número inteiro")
    .min(1, "Idade deve ser maior que 0")
    .max(150, "Idade deve ser menor que 150"),
  email: z.string()
    .trim()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: {
    id: string;
    name: string;
    registration_number: string;
    course: string;
    age: number;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentForm = ({ student, open, onOpenChange }: StudentFormProps) => {
  const queryClient = useQueryClient();
  
  const defaultValues = {
    name: "",
    registration_number: "",
    course: "",
    age: 18,
    email: "",
  };

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      name: student.name,
      registration_number: student.registration_number,
      course: student.course,
      age: student.age,
      email: student.email,
    } : defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const insertData: Database["public"]["Tables"]["students"]["Insert"] = {
        name: data.name,
        registration_number: data.registration_number,
        course: data.course,
        age: data.age,
        email: data.email,
      };
      const { error } = await supabase.from("students").insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno cadastrado com sucesso!");
      form.reset(defaultValues);
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        if (error.message.includes("registration_number")) {
          toast.error("Esta matrícula já está cadastrada");
        } else if (error.message.includes("email")) {
          toast.error("Este email já está cadastrado");
        }
      } else {
        toast.error("Erro ao cadastrar aluno");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const { error } = await supabase
        .from("students")
        .update(data)
        .eq("id", student!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno atualizado com sucesso!");
      form.reset(defaultValues);
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        if (error.message.includes("registration_number")) {
          toast.error("Esta matrícula já está cadastrada");
        } else if (error.message.includes("email")) {
          toast.error("Este email já está cadastrado");
        }
      } else {
        toast.error("Erro ao atualizar aluno");
      }
    },
  });

  const onSubmit = (data: StudentFormData) => {
    if (student) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
          <DialogDescription>
            {student
              ? "Atualize as informações do aluno abaixo."
              : "Preencha os dados do novo aluno."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="2024001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <FormControl>
                    <Input placeholder="Engenharia de Software" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : student
                  ? "Atualizar"
                  : "Cadastrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
