import { type ComponentProps, useState } from "react";

import { cn } from "cn";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = ComponentProps<typeof Input>;

const PasswordInput = ({ className, ...inputProps }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => setIsVisible((visible) => !visible);

  return (
    <div className="relative">
      <Input {...inputProps} className={cn("pr-10", className)} type={isVisible ? "text" : "password"} />
      <Button
        aria-controls={inputProps.id}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 h-full text-muted-foreground hover:bg-transparent"
        size="icon"
        type="button"
        variant="ghost"
        onClick={handleToggle}
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
};

export default PasswordInput;
