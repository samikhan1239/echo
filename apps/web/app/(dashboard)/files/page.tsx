import { FilesView } from "@/modules/files/ui/views/files-view";
import { Protect } from "@clerk/nextjs";

import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { Files } from "lucide-react";
const Page = () => {
    return (
    <Protect
    
    condition={(has) => has({plan:"free_org"})}
    fallback={<PremiumFeatureOverlay> 

       <FilesView/>

    </PremiumFeatureOverlay>
    
}
    
    >
    
    
    
    
    
    <FilesView/>
    </Protect>
    
    )
}
 
export default Page;