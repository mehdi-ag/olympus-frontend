import { Modal, Paper, Typography, SvgIcon, Link, Button } from "@material-ui/core";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import { FormControl } from "@material-ui/core";
import { useWeb3Context } from "src/hooks/web3Context";
import { txnButtonText } from "../../slices/PendingTxnsSlice";
import { useSelector } from "react-redux";
import { WalletGraphic, VaultGraphic, ArrowGraphic } from "../../components/EducationCard";
import { IAccountSlice } from "src/slices/AccountSlice";
import { IPendingTxn } from "../../slices/PendingTxnsSlice";
import { BigNumber } from "bignumber.js";
import { Project } from "src/components/GiveProject/project.type";
import { hasPendingGiveTxn, PENDING_TXN_WITHDRAW } from "src/slices/GiveThunk";
import { t, Trans } from "@lingui/macro";
import { shorten } from "src/helpers";

export interface WithdrawSubmitCallback {
  (walletAddress: string, depositAmount: BigNumber): void;
}

export interface WithdrawCancelCallback {
  (): void;
}

type WithdrawModalProps = {
  isModalOpen: boolean;
  callbackFunc: WithdrawSubmitCallback;
  cancelFunc: WithdrawCancelCallback;
  walletAddress: string;
  depositAmount: BigNumber; // As per IUserDonationInfo
  project?: Project;
};

// TODO consider shifting this into interfaces.ts
type State = {
  account: IAccountSlice;
  pendingTransactions: IPendingTxn[];
};

export function WithdrawDepositModal({
  isModalOpen,
  callbackFunc,
  cancelFunc,
  walletAddress,
  depositAmount,
  project,
}: WithdrawModalProps) {
  const { address } = useWeb3Context();
  const pendingTransactions = useSelector((state: State) => {
    return state.pendingTransactions;
  });

  const canSubmit = () => {
    if (!address) return false;
    if (hasPendingGiveTxn(pendingTransactions)) return false;

    return true;
  };

  const handleModalInsideClick = (e: any): void => {
    // When the user clicks within the modal window, we do not want to pass the event up the tree
    e.stopPropagation();
  };

  /**
   * Calls the submission callback function that is provided to the component.
   */
  const handleSubmit = () => {
    callbackFunc(walletAddress, new BigNumber(depositAmount));
  };

  const getRecipientTitle = () => {
    if (!project) return shorten(walletAddress);

    if (!project.owner) return project.title;

    return project.owner + " - " + project.title;
  };

  return (
    /* modal-container displays a background behind the ohm-card container, which means that if modal-container receives a click, we can close the modal */
    <Modal className="modal-container" open={isModalOpen} onClose={cancelFunc} onClick={cancelFunc} hideBackdrop={true}>
      <Paper className="ohm-card ohm-modal" onClick={handleModalInsideClick}>
        <div className="yield-header">
          <Link onClick={() => cancelFunc()}>
            <SvgIcon color="primary" component={XIcon} />
          </Link>
          <Typography variant="h4">
            <Trans>Withdraw Deposit?</Trans>
          </Typography>
        </div>
        <div className="give-education-graphics">
          <VaultGraphic quantity={depositAmount.toString()} verb={t`withdrawn`} />
          <ArrowGraphic />
          <WalletGraphic quantity={depositAmount.toString()} verb={t`deposited`} />
        </div>

        <Typography variant="body1">
          <Trans>Any remaining yield will still be redeemable by the recipient ({getRecipientTitle()}).</Trans>
        </Typography>
        <FormControl className="ohm-modal-submit">
          <Button variant="contained" color="primary" disabled={!canSubmit()} onClick={() => handleSubmit()}>
            {txnButtonText(pendingTransactions, PENDING_TXN_WITHDRAW, t`Withdraw`)}
          </Button>
        </FormControl>
      </Paper>
    </Modal>
  );
}
