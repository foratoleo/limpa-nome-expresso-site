/**
 * FormInput Component Demo
 *
 * This file demonstrates the usage of FormInput component.
 * It's not a unit test, but a reference implementation showing how to use the component.
 */

import { FormInput } from "./FormInput";
import { FormSection } from "./FormSection";
import { FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export function FormDemo() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      income: "",
      birthDate: "",
      address: "",
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* FormSection: Collapsible section with progress */}
      <FormSection
        title="Informações Pessoais"
        description="Preencha seus dados básicos"
        totalFields={3}
        completedFields={2}
        defaultOpen
      >
        <div className="space-y-4">
          {/* Text input */}
          <FormInput
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            required
            {...form.register("name")}
          />

          {/* Text input with description */}
          <FormInput
            label="Email"
            type="email"
            description="Usaremos este email para contato"
            placeholder="seu@email.com"
            {...form.register("email")}
          />

          {/* Number input */}
          <FormInput
            label="Telefone"
            inputType="number"
            placeholder="(11) 99999-9999"
            {...form.register("phone")}
          />
        </div>
      </FormSection>

      {/* FormSection: Financial information */}
      <FormSection
        title="Informações Financeiras"
        description="Dados sobre renda e pagamentos"
        totalFields={2}
        completedFields={0}
        completed={false}
      >
        <div className="space-y-4">
          {/* Currency input */}
          <FormInput
            label="Renda Mensal"
            inputType="currency"
            placeholder="R$ 0,00"
            description="Informe sua renda bruta mensal"
            {...form.register("income")}
          />

          {/* Date input */}
          <FormInput
            label="Data de Nascimento"
            inputType="date"
            {...form.register("birthDate")}
          />
        </div>
      </FormSection>

      {/* FormSection: Address information - completed */}
      <FormSection
        title="Endereço"
        completed={true}
        totalFields={1}
        completedFields={1}
      >
        <div className="space-y-4">
          {/* Textarea input */}
          <FormInput
            label="Endereço Completo"
            inputType="textarea"
            placeholder="Rua, número, bairro, cidade"
            {...form.register("address")}
          />
        </div>
      </FormSection>

      {/* FormSection: Error state demonstration */}
      <FormSection
        title="Documentação"
        description="Exemplo com erro de validação"
        totalFields={1}
        completedFields={0}
      >
        <div className="space-y-4">
          <FormInput
            label="CPF"
            placeholder="000.000.000-00"
            error="CPF inválido. Verifique os números digitados."
            required
          />
        </div>
      </FormSection>
    </div>
  );
}
