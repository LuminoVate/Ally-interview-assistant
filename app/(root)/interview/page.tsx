import React from 'react'
import Agent from "@/components/Agent"
// import {getCurrentUser} from "@/lib/actions/auth.action";

const page = () => {

  // const user = await getCurrentUser();
  return (
    <div>
      <h3>Interview Generation</h3>
      <Agent userName="minul" userId="123" type="generate"/>
    </div>
  )
}

export default page


