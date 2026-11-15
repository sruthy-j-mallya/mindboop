import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemsApi";

import { INITIAL_FORM_VALUES, PARK_VALIDATION_SCHEMA, type ParkFormValues } from "./constants";

// Parks a thought on Enter. The input clears as soon as it's sent, so the next thought can be typed straight away. A
// failed one comes back into the input if it's still empty.
const ParkForm = () => {
  const { mutate: createItem, error } = useCreateParkingLotItem();
  const {
    register,
    handleSubmit,
    resetField,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ParkFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(PARK_VALIDATION_SCHEMA),
  });
  const errorMessage = errors.content?.message ?? error?.message;

  const handleBlur = () => clearErrors("content");

  const handlePark = ({ content }: ParkFormValues) => {
    resetField("content");
    const handleError = () => {
      if (!getValues("content")) setValue("content", content);
    };
    createItem({ content }, { onError: handleError });
  };

  return (
    <form noValidate className="grid gap-2" onSubmit={handleSubmit(handlePark)}>
      <div className="relative">
        <Input
          aria-describedby={errorMessage ? "park-error" : undefined}
          aria-invalid={!!errors.content}
          aria-label="Thought to park"
          autoComplete="off"
          className="h-9 rounded-lg pr-10"
          placeholder="Park a thought…"
          {...register("content", { onBlur: handleBlur })}
        />
        <Button
          aria-label="Park"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          size="icon-xs"
          type="submit"
          variant="ghost"
        >
          <CornerDownLeft />
        </Button>
      </div>
      {errorMessage && (
        <p className="text-sm text-destructive" id="park-error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
};

export default ParkForm;
