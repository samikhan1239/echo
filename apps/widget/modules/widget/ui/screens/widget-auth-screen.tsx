
import { WidgetHeader } from "../components/widget-header";
import {useForm} from "react-hook-form"
import{z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Languages } from "lucide-react";
import { platform } from "os";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";



const formSchema = z.object({
  name:z.string().min(1,"Name is required"),
  email: z.string().email("Invalid email address")
});




export const WidgetAuthScreen = () =>{

  const setScreen = useSetAtom(screenAtom);
  const organizationId =  useAtomValue(organizationIdAtom);

  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || "")
  );
const form = useForm<z.infer<typeof formSchema>> ({
  resolver: zodResolver(formSchema),
  defaultValues :{
    name: "",
    email: "",
  }

});

const createContactSession = useMutation(api.public.contactSessions.create);


const onSubmit = async (values: z.infer<typeof formSchema>) =>{


  if(!organizationId){
    return;
  }
 const metadata: Doc<"contactSessions">["metadata"] ={
  userAgent: navigator.userAgent,
  language: navigator.language,
  languages: navigator.languages?.join(","),
  platform: navigator.platform,
  vendor: navigator.vendor,
  screenResolution :`${screen.width}x${screen.height}`,
  viewportSize:`${window.innerWidth}x${window.innerHeight}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset: new Date().getTimezoneOffset(),
  cookieEnabled: navigator.cookieEnabled,
  referrer: document.referrer || "direct",
  currentUrl: window.location.href,



 };

const contactSessionId = await createContactSession({
  ...values,
  organizationId,
  metadata,
});

setContactSessionId(contactSessionId);
setScreen("selection");
}

    return (
        <>
        <WidgetHeader>
  <div className ="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
    <p className =" text-3xl">
      Hi there! 👋
    </p>
    <p className=" text-lg">
    Let&apos;s get you started
    </p>

  </div>
  </WidgetHeader>
  <Form {...form}>
    <form
    className= " flex flex-1 flex-col gap-y-4 p-4 "
    onSubmit ={form.handleSubmit(onSubmit)}>
      <FormField
      control={form.control}
      name="name"
      render={({field})=>(
        <FormItem>
          <FormControl>
      <Input
      className="h-10 bg-background"
      placeholder="e.g. John Doe"
      type="text"
      {...field}
      
      />
    

    
          </FormControl>
            <FormMessage/>

        </FormItem>
      )}
      
      />

      <FormField
      control={form.control}
      name="email"
      render={({field})=>(
        <FormItem>
          <FormControl>
      <Input
      className="h-10 bg-background"
      placeholder="e.g. john.doe@example.com"
      type="email"
      {...field}
      
      />
    

    
          </FormControl>
          <FormMessage/>

        </FormItem>
      )}
      
      />
<Button
disabled={form.formState.isSubmitting}
size="lg"
type="submit">
  Continue


</Button>

 

    </form>

  </Form>
        </>

    )
}
