'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import ContentCopyIcon from '@/public/images/icons/content-copy.svg';

export default function ChmodCalculator() {
  const [ownerValue, setOwnerValue] = useState(0);
  const [groupValue, setGroupValue] = useState(0);
  const [publicValue, setPublicValue] = useState(0);

  // Read
  const [ownerRead, setOwnerRead] = useState(false);
  const [groupRead, setGroupRead] = useState(false);
  const [publicRead, setPublicRead] = useState(false);

  // Write
  const [ownerWrite, setOwnerWrite] = useState(false);
  const [groupWrite, setGroupWrite] = useState(false);
  const [publicWrite, setPublicWrite] = useState(false);

  //Execution
  const [ownerExecution, setOwnerExecution] = useState(false);
  const [groupExecution, setGroupExecution] = useState(false);
  const [publicExecution, setPublicExecution] = useState(false);

  return (
    <>
      {/* <Head title="Chronometer" /> */}
      <Card>
        <CardTitle>CHMOD Generator</CardTitle>
        <div className="py-4" />
        <CardDescription>CHMOD Generator</CardDescription>

        <CardContent>
          <table className="overflow-hidden w-full max-w-3xl mx-auto my-1 border-collapse">
            <thead>
              <tr>
                <th className="text-center align-middle p-2.5" />
                <th className="text-center align-middle p-2.5">Owner (u)</th>
                <th className="text-center align-middle p-2.5">Group (g)</th>
                <th className="text-center align-middle p-2.5">Public (o)</th>
              </tr>
            </thead>
            <tbody className="border border-solid border-[#dae9f2]">
              <tr>
                <td className="text-center align-middle p-2.5">Read (4)</td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={ownerRead}
                    onClick={() => {
                      setOwnerRead((prev) => !prev);
                      setOwnerValue((prev) =>
                        !ownerRead ? prev + 4 : prev - 4
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={groupRead}
                    onClick={() => {
                      setGroupRead((prev) => !prev);
                      setGroupValue((prev) =>
                        !groupRead ? prev + 4 : prev - 4
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={publicRead}
                    onClick={() => {
                      setPublicRead((prev) => !prev);
                      setPublicValue((prev) =>
                        !publicRead ? prev + 4 : prev - 4
                      );
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle p-2.5">Write (2)</td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={ownerWrite}
                    onClick={() => {
                      setOwnerWrite((prev) => !prev);
                      setOwnerValue((prev) =>
                        !ownerWrite ? prev + 2 : prev - 2
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={groupWrite}
                    onClick={() => {
                      setGroupWrite((prev) => !prev);
                      setGroupValue((prev) =>
                        !groupWrite ? prev + 2 : prev - 2
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={publicWrite}
                    onClick={() => {
                      setPublicWrite((prev) => !prev);
                      setPublicValue((prev) =>
                        !publicWrite ? prev + 2 : prev - 2
                      );
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-center align-middle p-2.5">
                  Execution (1)
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={ownerExecution}
                    onClick={() => {
                      setOwnerExecution((prev) => !prev);
                      setOwnerValue((prev) =>
                        !ownerExecution ? prev + 1 : prev - 1
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={groupExecution}
                    onClick={() => {
                      setGroupExecution((prev) => !prev);
                      setGroupValue((prev) =>
                        !groupExecution ? prev + 1 : prev - 1
                      );
                    }}
                  />
                </td>
                <td className="text-center align-middle p-2.5">
                  <Checkbox
                    checked={publicExecution}
                    onClick={() => {
                      setPublicExecution((prev) => !prev);
                      setPublicValue((prev) =>
                        !publicExecution ? prev + 1 : prev - 1
                      );
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="w-full text-center text-5xl font-mono my-20">
            {ownerValue}
            {groupValue}
            {publicValue}
          </div>
          <div className="w-full text-center text-5xl font-mono my-20">
            {ownerRead ? 'r' : '-'}
            {ownerWrite ? 'w' : '-'}
            {ownerExecution ? 'x' : '-'}
            {groupRead ? 'r' : '-'}
            {groupWrite ? 'w' : '-'}
            {groupExecution ? 'x' : '-'}
            {publicRead ? 'r' : '-'}
            {publicWrite ? 'w' : '-'}
            {publicExecution ? 'x' : '-'}
          </div>
          <CopyButton
            value={'chmod ' + ownerValue + groupValue + publicValue + ' path'}
          />
        </CardContent>
      </Card>
    </>
  );
}

const CopyButton = ({ value, copied }) => {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input value={value} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => navigator.clipboard.writeText(value)}>
              <ContentCopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{true === true ? 'Copy to clipboard' : 'Copied!'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
