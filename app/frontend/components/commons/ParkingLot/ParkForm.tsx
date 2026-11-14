import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateParkingLotItem } from "@/hooks/reactQuery/useParkingLotItemsApi";

import {
  INITIAL_FORM_VALUES,
  PARK_VALIDATION_SCHEMA,
  type ParkFormValues,
  PARKING_LOT_ITEM_KINDS,
} from "./constants";

// Parks a thought on Enter. The input clears as soon as it's sent and the kind stays picked, so the next thought can be
// typed straight away. A failed one comes back into the input if it's still empty.
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

  const handlePark = ({ content, kind }: ParkFormValues) => {
    resetField("content");
    const handleError = () => {
      if (!getValues("content")) setValue("content", content);
    };
    createItem({ content, kind }, { onError: handleError });
  };

  return (
    <form noValidate className="grid gap-3" onSubmit={handleSubmit(handlePark)}>
      {/* Native radios, hidden behind chip-styled labels, give the group arrow-key navigation for free. */}
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Kind</legend>
        {PARKING_LOT_ITEM_KINDS.map((kind) => (
          <label
            key={kind}
            className="cursor-pointer rounded-full bg-muted px-3 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input className="sr-only" type="radio" value={kind} {...register("kind")} />
            {kind}
          </label>
        ))}
      </fieldset>
      {/* An explicit submit button: with the kind radios in the form, Enter alone isn't a reliable submit. */}
      <div className="relative">
        <Input
          aria-describedby={errorMessage ? "park-error" : undefined}
          aria-invalid={!!errors.content}
          aria-label="Thought to park"
          autoComplete="off"
          className="h-11 rounded-xl pr-12"
          placeholder="Park a thought…"
          {...register("content", { onBlur: handleBlur })}
        />
        <Button
          aria-label="Park"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
          size="icon-sm"
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
