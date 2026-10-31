import { Link, type LinkProps } from "react-router";

const TextLink = (props: LinkProps) => (
  <Link className="text-primary underline-offset-4 hover:underline" {...props} />
);

export default TextLink;
