import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBailOutTimeLog } from "@/hooks/reactQuery/useTimeLogBailOutsApi";

import { BREADCRUMB_VALIDATION_SCHEMA, type BreadcrumbFormValues, INITIAL_FORM_VALUES } from "./constants";

const LABEL_CLASS_NAME = "font-normal tracking-wider text-muted-foreground uppercase";

type BailDialogProps = { timeLogId: string; onClose: () => void };

const BailDialog = ({ timeLogId, onClose }: BailDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BreadcrumbFormValues>({
    resolver: zodResolver(BREADCRUMB_VALIDATION_SCHEMA),
    defaultValues: INITIAL_FORM_VALUES,
    mode: "onChange",
  });
  const { mutate: bailOut, isPending, error } = useBailOutTimeLog();

  const handleValidSubmit = (values: BreadcrumbFormValues) =>
    bailOut({ timeLogId, ...values }, { onSuccess: onClose });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="gap-6 rounded-2xl p-8 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Leave breadcrumbs</DialogTitle>
          <DialogDescription className="text-base">
            No guilt. Just leave a trail so future-you can jump back in.
          </DialogDescription>
        </DialogHeader>
        <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(handleValidSubmit)}>
          <div className="grid gap-2">
            <Label className={LABEL_CLASS_NAME} htmlFor="completedDescription">
              What got done
            </Label>
            <Textarea
              aria-invalid={!!errors.completedDescription}
              className="min-h-20 bg-input-background"
              id="completedDescription"
              {...register("completedDescription")}
            />
            {errors.completedDescription && (
              <p className="text-sm text-destructive">{errors.completedDescription.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label className={LABEL_CLASS_NAME} htmlFor="restartDescription">
              Very next step
            </Label>
            <Input
              aria-invalid={!!errors.restartDescription}
              id="restartDescription"
              placeholder="e.g. Open doc, finish paragraph 2"
              {...register("restartDescription")}
            />
            {errors.restartDescription && (
              <p className="text-sm text-destructive">{errors.restartDescription.message}</p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
          <Button disabled={isPending || !isValid} size="lg" type="submit">
            Save &amp; exit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BailDialog;
